export default function Footer() {
  return (
    <footer className="bg-[var(--color-nhl-panel)] border-t border-[var(--color-nhl-border)] py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[var(--color-nhl-muted)]">
          <p>© {new Date().getFullYear()} Benelux Ice Hockey Ecosystem. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}