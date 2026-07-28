import { z } from 'zod';

export const rsvpSchema = z.object({
  event_id: z.string().min(1, "L'identifiant de l'événement est requis"),
  first_name: z.string().min(1, "Prénom requis").max(80, "Le prénom est trop long").trim(),
  party_size: z.union([z.string(), z.number()]).transform((val) => {
    const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
    return isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), 20);
  }),
  ceremonies_attending: z.array(z.string().max(50).regex(/^[\w\-]+$/)).max(10).optional().default([]),
});

export const guestbookSchema = z.object({
  event_id: z.string().min(1, "L'identifiant de l'événement est requis"),
  author_name: z.string().min(1, "Le nom est requis").max(50, "Le nom est trop long").trim(),
  message: z.string().min(1, "Le message est requis").max(500, "Le message est trop long (max 500 caractères)").trim(),
});
