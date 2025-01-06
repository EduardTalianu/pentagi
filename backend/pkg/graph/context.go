package graph

import (
	"context"
	"errors"
	"fmt"
	"pentagi/pkg/database"
	"regexp"
	"slices"
)

// This file will not be regenerated automatically.
//
// It contains helper functions to get and set values in the context.

var permAdminRegexp = regexp.MustCompile(`^(.+)\.[a-z]+$`)

type GqlContextKey string

const (
	UserIDKey       GqlContextKey = "userID"
	UserPermissions GqlContextKey = "userPermissions"
)

func GetUserID(ctx context.Context) (uint64, error) {
	userID, ok := ctx.Value(UserIDKey).(uint64)
	if !ok {
		return 0, errors.New("user ID not found")
	}
	return userID, nil
}

func SetUserID(ctx context.Context, userID uint64) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}

func GetUserPermissions(ctx context.Context) ([]string, error) {
	userPermissions, ok := ctx.Value(UserPermissions).([]string)
	if !ok {
		return nil, errors.New("user permissions not found")
	}
	return userPermissions, nil
}

func SetUserPermissions(ctx context.Context, userPermissions []string) context.Context {
	return context.WithValue(ctx, UserPermissions, userPermissions)
}

func validatePermission(ctx context.Context, perm string) (int64, bool, error) {
	uid, err := GetUserID(ctx)
	if err != nil {
		return 0, false, fmt.Errorf("unauthorized: invalid user: %v", err)
	}

	privs, err := GetUserPermissions(ctx)
	if err != nil {
		return 0, false, fmt.Errorf("unauthorized: invalid user permissions: %v", err)
	}

	permAdmin := permAdminRegexp.ReplaceAllString(perm, "$1.admin")
	if isAdmin := slices.Contains(privs, permAdmin); isAdmin {
		return int64(uid), true, nil
	}

	if slices.Contains(privs, perm) {
		return int64(uid), false, nil
	}

	return 0, false, fmt.Errorf("requested permission '%s' not found", perm)
}

func validatePermissionWithFlowID(
	ctx context.Context,
	perm string,
	flowID int64,
	db database.Querier,
) (int64, error) {
	uid, admin, err := validatePermission(ctx, perm)
	if err != nil {
		return 0, err
	}

	flow, err := db.GetFlow(ctx, flowID)
	if err != nil {
		return 0, err
	}

	if !admin && flow.UserID != int64(uid) {
		return 0, fmt.Errorf("not permitted")
	}

	return uid, nil
}
