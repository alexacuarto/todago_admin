-- ============================================================================
-- SQL Migration: add_booking_cancellation_fields.sql
-- ============================================================================

-- Add cancellation tracking fields to the bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancel_details TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
