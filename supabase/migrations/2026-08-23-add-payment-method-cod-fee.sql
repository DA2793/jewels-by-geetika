-- ═══════════════════════════════════════════════
-- Fix: orders insert failing for all checkouts
-- The server-side checkout code inserts payment_method and cod_fee,
-- but these columns were never added to public.orders.
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor).
-- ═══════════════════════════════════════════════

alter table public.orders
  add column if not exists payment_method text default 'prepaid'
    check (payment_method in ('prepaid', 'cod'));

alter table public.orders
  add column if not exists cod_fee numeric(10,2) default 0;
