-- Add naboopay to the payment_provider enum
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'naboopay';
