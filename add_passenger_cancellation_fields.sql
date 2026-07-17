-- ============================================================
-- SQL Migration: Add Passenger Cancellation Metrics to passengers table
-- ============================================================

-- 1. Add cancellation fields to passengers table
ALTER TABLE public.passengers ADD COLUMN IF NOT EXISTS cancel_count INT DEFAULT 0;
ALTER TABLE public.passengers ADD COLUMN IF NOT EXISTS last_cancel_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.passengers ADD COLUMN IF NOT EXISTS booking_restriction_until TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public.passengers ADD COLUMN IF NOT EXISTS warning_status BOOLEAN DEFAULT FALSE;

-- 2. Update the handle_booking_cancellation trigger function
-- Implements the temporary restriction cancellation policy on the passengers table.
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  v_cancel_count integer;
BEGIN
  -- Count cancelled bookings for this passenger within the last 30 days
  SELECT COUNT(*) INTO v_cancel_count
  FROM public.bookings
  WHERE passenger_id = COALESCE(NEW.passenger_id, OLD.passenger_id)
    AND status = 'cancelled'
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Update cancellation policy fields on passengers table
  IF v_cancel_count >= 4 THEN
    UPDATE public.passengers
    SET 
      cancel_count = v_cancel_count,
      last_cancel_date = NOW(),
      booking_restriction_until = NOW() + INTERVAL '7 days',
      warning_status = false
    WHERE id = COALESCE(NEW.passenger_id, OLD.passenger_id);
  ELSIF v_cancel_count = 3 THEN
    UPDATE public.passengers
    SET 
      cancel_count = v_cancel_count,
      last_cancel_date = NOW(),
      booking_restriction_until = NULL,
      warning_status = true
    WHERE id = COALESCE(NEW.passenger_id, OLD.passenger_id);
  ELSE
    UPDATE public.passengers
    SET 
      cancel_count = v_cancel_count,
      last_cancel_date = COALESCE(last_cancel_date, NOW()),
      booking_restriction_until = NULL,
      warning_status = false
    WHERE id = COALESCE(NEW.passenger_id, OLD.passenger_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the cancellation trigger
DROP TRIGGER IF EXISTS on_booking_cancelled ON public.bookings;
CREATE TRIGGER on_booking_cancelled
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION public.handle_booking_cancellation();
