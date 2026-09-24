/** Shapes of the 42 API responses the app uses (only the fields it reads). */

export type Skill = { id: number; name: string; level: number };

export type CursusUser = {
  id: number;
  level: number;
  grade: string | null;
  begin_at: string;
  end_at: string | null;
  cursus_id: number;
  cursus: { id: number; name: string; slug: string };
  skills: Skill[];
};

export type ProjectUser = {
  id: number;
  final_mark: number | null;
  status: string;
  "validated?": boolean | null;
  marked_at: string | null;
  cursus_ids: number[];
  project: { id: number; name: string; slug: string; parent_id: number | null };
};

/** `GET /v2/users/:login`. */
export type ApiUser = {
  id: number;
  login: string;
  email: string;
  phone: string | null;
  displayname: string;
  image: {
    link: string | null;
    versions: {
      large: string | null;
      medium: string | null;
      small: string | null;
    } | null;
  } | null;
  location: string | null;
  wallet: number;
  correction_point: number;
  pool_year: string | null;
  campus: { id: number; name: string }[];
  cursus_users: CursusUser[];
  projects_users: ProjectUser[];
};

/** A user as the app uses it: their profile plus their events. */
export type User = ApiUser & {
  events: FtEvent[];
};

/** An item of `GET /v2/users/:login/events`. */
export type FtEvent = {
  id: number;
  name: string;
  description: string;
  kind: string;
  location: string;
  begin_at: string;
  end_at: string;
  max_people: number | null;
  nbr_subscribers: number;
  prohibition_of_cancellation: number | null;
  campus_ids: number[];
  cursus_ids: number[];
  themes: { id: number; name: string }[];
  waitlist: { id: number; waitlistable_id: number } | null;
  created_at: string;
  updated_at: string;
};
