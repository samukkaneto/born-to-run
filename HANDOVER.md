# Born to Run - Technical Handover Document

> **To the Next AI Agent / Assistant:**
> You are taking over the development of the **Born to Run - Treinamento e Saúde** web application. This document outlines the current state of the architecture, database, and features. Please read this carefully to context-switch into the project seamlessly.

## 1. Tech Stack & Architecture
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **Backend/Auth/DB:** Supabase (PostgreSQL)
- **Language:** TypeScript / React (Server Components & Client Components)

## 2. Database Schema (Supabase)
The database uses PostgreSQL with Row Level Security (RLS) enabled.
### Tables:
1. **`profiles`**
   - `id` (uuid, references auth.users)
   - `user_id` (uuid, unique)
   - `full_name` (text)
   - `avatar_url` (text)
   - `role` (text) - Can be 'member', 'admin', or 'treinador'
   - `bio`, `cidade`, `objetivo` (text)
2. **`posts`** (Social Feed)
   - `id` (uuid)
   - `user_id` (uuid, references profiles)
   - `content` (text)
   - `image_url` (text) - Stored in Supabase Storage bucket `post-images`
3. **`workouts`** (Private Workouts)
   - `id` (uuid)
   - `created_by` (uuid, references profiles - The Admin/Trainer)
   - `assigned_to` (uuid, references profiles - The Student)
   - `title`, `description`, `level`, `objective` (text)

### Storage Buckets:
- `avatars` (For user profile pictures)
- `post-images` (For photos in the social feed / personal gallery)

## 3. Project Structure
- `/app/layout.tsx` - Root layout.
- `/app/page.tsx` - Landing Page (Public).
- `/app/auth/` - Authentication routes & callback handling.
- `/app/(dashboard)/` - Protected routes. Uses a Route Group `(dashboard)` so the URL paths are clean (`/treinos`, `/fotos`, `/perfil`).
  - `/app/(dashboard)/layout.tsx` - Contains the Sidebar (Desktop) and Bottom Navigation (Mobile).
  - `/app/(dashboard)/dashboard/page.tsx` - Team Social Feed.
  - `/app/(dashboard)/treinos/page.tsx` - Private workouts. Renders differently for Admin/Trainer vs Students.
  - `/app/(dashboard)/fotos/page.tsx` - Personal photo gallery.
  - `/app/(dashboard)/perfil/page.tsx` - Profile editor.
- `/app/actions/` - Next.js Server Actions (e.g., `post.ts`, `profile.ts`, `workouts.ts`).
- `/components/` - UI Components divided by feature (`layout`, `feed`, `workouts`, `profile`).

## 4. Current State & Known Issues
- The core MVP is fully functional. Authentication works, the database is connected, and RLS policies restrict data access properly (e.g., users can only see their own workouts).
- The user is the Admin (Samuel) and his father (Robson) is the Trainer. They both need `role = 'admin'` or `'treinador'` in the database to see the "New Workout" button.
- **Next Steps for you:** The user felt the current AI (me) was hesitant to use Fable 5 or external integrations, and they want to ensure the UI/UX is pushed to the next level. Focus on highly polished, premium aesthetics, bug-hunting, and adding any missing QoL (Quality of Life) features. 

**End of Handover.** Good luck!
