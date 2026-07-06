-- FIX: GENERATE BOOKING NUMBER BY MAX SUFFIX INSTEAD OF COUNT
-- Resolves: duplicate key value violates unique constraint "bookings_booking_number_key"

CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  v_today_prefix TEXT;
  v_max_suffix INTEGER;
BEGIN
  v_today_prefix := 'TG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
  
  -- Find the maximum suffix number used today using regex matching the end digits
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(booking_number FROM '([0-9]+)$') AS INTEGER)), 
    0
  ) + 1 INTO v_max_suffix
  FROM public.bookings
  WHERE booking_number LIKE v_today_prefix;

  NEW.booking_number := 'TG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_max_suffix::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
