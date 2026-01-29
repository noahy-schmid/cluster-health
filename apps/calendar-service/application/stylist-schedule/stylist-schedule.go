package stylistschedule

import (
	"example/hello/ports"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type StylistScheduleService interface {
	BookAppointment(scheduleID string, name string, startTime time.Time, endTime time.Time) (string, error)
	CreateSchedule() (string, error)
	Exists(scheduleID string) bool
}

type stylistScheduleService struct {
	calendarRepository ports.CalendarRepository
}

func NewStylistScheduleService() StylistScheduleService {
	panic("")
}

func (s *stylistScheduleService) BookAppointment(scheduleID string, name string, startTime time.Time, endTime time.Time) (string, error) {
	if !s.Exists(scheduleID) {
		return "", fmt.Errorf("schedule with ID %s does not exist", scheduleID)
	}

	// Get the day (normalized to start of day)
	day := time.Date(startTime.Year(), startTime.Month(), startTime.Day(), 0, 0, 0, 0, startTime.Location())

	// Get existing events for that day
	events, err := s.calendarRepository.GetCalendarEvents(scheduleID, day)
	if err != nil {
		return "", fmt.Errorf("failed to get calendar events: %w", err)
	}

	// Check for conflicts
	for _, event := range events {
		if startTime.Before(event.EndTime) && endTime.After(event.StartTime) {
			return "", fmt.Errorf("time slot conflicts with existing appointment: %s", event.Title)
		}
	}

	// Create new event
	newEvent := ports.CalendarEvent{
		ID:        uuid.New().String(),
		StartTime: startTime,
		EndTime:   endTime,
		Title:     name,
	}

	err = s.calendarRepository.AddCalendarEvent(scheduleID, newEvent)
	if err != nil {
		return "", fmt.Errorf("failed to add calendar event: %w", err)
	}

	return newEvent.ID, nil
}

func (s *stylistScheduleService) CreateSchedule() (string, error) {
	scheduleID, err := s.calendarRepository.CreateCalendar()
	if err != nil {
		return "", fmt.Errorf("failed to create calendar: %w", err)
	}
	return scheduleID, nil
}

func (s *stylistScheduleService) Exists(scheduleID string) bool {
	return s.calendarRepository.CalendarExists(scheduleID)
}
