-- ============================================================================
-- SQL Migration: fix_booking_cancellation_triggers.sql
-- ============================================================================

-- 1. Fix log_booking_status_change trigger function to include SECURITY DEFINER
-- This allows status logging to succeed under passenger/driver updates without RLS violation
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (booking_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix handle_booking_cancellation trigger function to update passengers instead of profiles
-- The cancellation metrics columns (cancel_count, last_cancel_date, etc.) exist on the passengers table.
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  v_cancel_count integer;
  v_passenger_id uuid;
BEGIN
  v_passenger_id := COALESCE(NEW.passenger_id, OLD.passenger_id);

  IF v_passenger_id IS NOT NULL THEN
    -- Count cancelled bookings for this passenger within the last 30 days
    SELECT COUNT(*) INTO v_cancel_count
    FROM public.bookings
    WHERE passenger_id = v_passenger_id
      AND status = 'cancelled'
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Update cancellation policy fields on passengers table (NOT profiles)
    IF v_cancel_count >= 4 THEN
      UPDATE public.passengers
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = NOW(),
        booking_restriction_until = NOW() + INTERVAL '7 days',
        warning_status = false
      WHERE id = v_passenger_id;
    ELSIF v_cancel_count = 3 THEN
      UPDATE public.passengers
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = NOW(),
        booking_restriction_until = NULL,
        warning_status = true
      WHERE id = v_passenger_id;
    ELSE
      UPDATE public.passengers
      SET 
        cancel_count = v_cancel_count,
        last_cancel_date = COALESCE(last_cancel_date, NOW()),
        booking_restriction_until = NULL,
        warning_status = false
      WHERE id = v_passenger_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
