import { Profile } from "@/lib/api";

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer>
      <span>{profile.display_name} © {new Date().getFullYear()}</span>
      <span>Built with <a href="#">Vexentra</a> — Portfolio Platform</span>
      <span>{profile.location}</span>
    </footer>
  );
}
