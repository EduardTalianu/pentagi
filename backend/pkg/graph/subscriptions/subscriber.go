package subscriptions

import (
	"context"

	"pentagi/pkg/graph/model"
)

type flowSubscriber struct {
	userID int64
	flowID int64
	ctrl   *controller
}

func (s *flowSubscriber) GetFlowID() int64 {
	return s.flowID
}

func (s *flowSubscriber) SetFlowID(flowID int64) {
	s.flowID = flowID
}

func (s *flowSubscriber) GetUserID() int64 {
	return s.userID
}

func (s *flowSubscriber) SetUserID(userID int64) {
	s.userID = userID
}

func (s *flowSubscriber) FlowCreatedAdmin(ctx context.Context) (<-chan *model.Flow, error) {
	return s.ctrl.flowCreatedAdmin.Subscribe(ctx, s.userID), nil
}

func (s *flowSubscriber) FlowCreated(ctx context.Context) (<-chan *model.Flow, error) {
	return s.ctrl.flowCreated.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) FlowDeletedAdmin(ctx context.Context) (<-chan *model.Flow, error) {
	return s.ctrl.flowDeletedAdmin.Subscribe(ctx, s.userID), nil
}

func (s *flowSubscriber) FlowDeleted(ctx context.Context) (<-chan *model.Flow, error) {
	return s.ctrl.flowDeleted.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) FlowUpdated(ctx context.Context) (<-chan *model.Flow, error) {
	return s.ctrl.flowUpdated.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) TaskCreated(ctx context.Context) (<-chan *model.Task, error) {
	return s.ctrl.taskCreated.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) TaskUpdated(ctx context.Context) (<-chan *model.Task, error) {
	return s.ctrl.taskUpdated.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) ScreenshotAdded(ctx context.Context) (<-chan *model.Screenshot, error) {
	return s.ctrl.screenshotAdded.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) TerminalLogAdded(ctx context.Context) (<-chan *model.TerminalLog, error) {
	return s.ctrl.terminalLogAdded.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) MessageLogAdded(ctx context.Context) (<-chan *model.MessageLog, error) {
	return s.ctrl.messageLogAdded.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) MessageLogUpdated(ctx context.Context) (<-chan *model.MessageLog, error) {
	return s.ctrl.messageLogUpdated.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) AgentLogAdded(ctx context.Context) (<-chan *model.AgentLog, error) {
	return s.ctrl.agentLogAdded.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) SearchLogAdded(ctx context.Context) (<-chan *model.SearchLog, error) {
	return s.ctrl.searchLogAdded.Subscribe(ctx, s.flowID), nil
}

func (s *flowSubscriber) VectorStoreLogAdded(ctx context.Context) (<-chan *model.VectorStoreLog, error) {
	return s.ctrl.vecStoreLogAdded.Subscribe(ctx, s.flowID), nil
}
