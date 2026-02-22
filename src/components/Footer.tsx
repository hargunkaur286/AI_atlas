const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-serif text-sm text-muted-foreground">
            Proof of Talk <span className="text-primary">Atlas</span>
          </span>
        </div>
        <p className="text-xs font-sans text-muted-foreground/50 tracking-wider">
          © 2026 Proof of Talk. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
