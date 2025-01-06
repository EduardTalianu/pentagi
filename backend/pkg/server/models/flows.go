package models

import (
	"pentagi/pkg/tools"
	"time"

	"github.com/jinzhu/gorm"
)

type FlowStatus string

const (
	FlowStatusCreated  FlowStatus = "created"
	FlowStatusRunning  FlowStatus = "running"
	FlowStatusWaiting  FlowStatus = "waiting"
	FlowStatusFinished FlowStatus = "finished"
	FlowStatusFailed   FlowStatus = "failed"
)

func (s FlowStatus) String() string {
	return string(s)
}

// Flow is model to contain flow information
// nolint:lll
type Flow struct {
	ID            uint64           `form:"id" json:"id" validate:"min=0,numeric" gorm:"type:BIGINT;NOT NULL;PRIMARY_KEY;AUTO_INCREMENT"`
	Status        FlowStatus       `form:"status" json:"status" validate:"oneof=created running waiting finished failed,required" gorm:"type:FLOW_STATUS;NOT NULL;default:'created'"`
	Title         string           `form:"title" json:"title" validate:"required" gorm:"type:TEXT;NOT NULL;default:'untitled'"`
	Model         string           `form:"model" json:"model" validate:"max=70,required" gorm:"type:TEXT;NOT NULL"`
	ModelProvider string           `form:"model_provider" json:"model_provider" validate:"max=70,required" gorm:"type:TEXT;NOT NULL"`
	Language      string           `form:"language" json:"language" validate:"max=70,required" gorm:"type:TEXT;NOT NULL"`
	Functions     *tools.Functions `form:"functions,omitempty" json:"functions,omitempty" validate:"omitempty,valid" gorm:"type:JSON;NOT NULL;default:'{}'"`
	UserID        uint64           `form:"user_id" json:"user_id" validate:"min=0,numeric" gorm:"type:BIGINT;NOT NULL"`
	CreatedAt     time.Time        `form:"created_at,omitempty" json:"created_at,omitempty" validate:"omitempty" gorm:"type:TIMESTAMPTZ;default:CURRENT_TIMESTAMP"`
	UpdatedAt     time.Time        `form:"updated_at,omitempty" json:"updated_at,omitempty" validate:"omitempty" gorm:"type:TIMESTAMPTZ;default:CURRENT_TIMESTAMP"`
	DeletedAt     *time.Time       `form:"deleted_at,omitempty" json:"deleted_at,omitempty" validate:"omitempty" sql:"index" gorm:"type:TIMESTAMPTZ"`
}

// TableName returns the table name string to guaranty use correct table
func (f *Flow) TableName() string {
	return "flows"
}

// Valid is function to control input/output data
func (f Flow) Valid() error {
	return validate.Struct(f)
}

// Validate is function to use callback to control input/output data
func (f Flow) Validate(db *gorm.DB) {
	if err := f.Valid(); err != nil {
		db.AddError(err)
	}
}

// CreateFlow is model to contain flow creation paylaod
// nolint:lll
type CreateFlow struct {
	Input     string           `form:"input" json:"input" validate:"required" example:"user input for first task in the flow"`
	Provider  string           `form:"provider" json:"provider" validate:"required" example:"openai"`
	Functions *tools.Functions `form:"functions,omitempty" json:"functions,omitempty" validate:"omitempty,valid"`
}

func (cf CreateFlow) Valid() error {
	return validate.Struct(cf)
}

// PatchFlow is model to contain flow patching paylaod
// nolint:lll
type PatchFlow struct {
	Action string  `form:"action" json:"action" validate:"required,oneof=stop,input" enums:"stop,input" default:"stop"`
	Input  *string `form:"input,omitempty" json:"input,omitempty" validate:"required_if=Action input" example:"user input for waiting flow"`
}

func (pf PatchFlow) Valid() error {
	return validate.Struct(pf)
}

// FlowTasksSubtasks is model to contain flow, linded tasks and linked subtasks information
// nolint:lll
type FlowTasksSubtasks struct {
	Tasks []TaskSubtasks `form:"tasks" json:"tasks" validate:"required" gorm:"foreignkey:FlowID;association_autoupdate:false;association_autocreate:false"`
	Flow  `form:"" json:""`
}

// TableName returns the table name string to guaranty use correct table
func (fts *FlowTasksSubtasks) TableName() string {
	return "flows"
}

// Valid is function to control input/output data
func (fts FlowTasksSubtasks) Valid() error {
	for i := range fts.Tasks {
		if err := fts.Tasks[i].Valid(); err != nil {
			return err
		}
	}
	return fts.Flow.Valid()
}

// Validate is function to use callback to control input/output data
func (fts FlowTasksSubtasks) Validate(db *gorm.DB) {
	if err := fts.Valid(); err != nil {
		db.AddError(err)
	}
}

// FlowContainers is model to contain flow and linked containers information
// nolint:lll
type FlowContainers struct {
	Containers []Container `form:"containers" json:"containers" validate:"required" gorm:"foreignkey:FlowID;association_autoupdate:false;association_autocreate:false"`
	Flow       `form:"" json:""`
}

// TableName returns the table name string to guaranty use correct table
func (fc *FlowContainers) TableName() string {
	return "flows"
}

// Valid is function to control input/output data
func (fc FlowContainers) Valid() error {
	for i := range fc.Containers {
		if err := fc.Containers[i].Valid(); err != nil {
			return err
		}
	}
	return fc.Flow.Valid()
}

// Validate is function to use callback to control input/output data
func (fc FlowContainers) Validate(db *gorm.DB) {
	if err := fc.Valid(); err != nil {
		db.AddError(err)
	}
}
