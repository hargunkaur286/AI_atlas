import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="font-serif text-lg tracking-wide text-foreground">
          Proof of Talk <span className="text-primary font-semibold">Atlas</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-sans tracking-wider uppercase text-muted-foreground">
        <a href="#" className="hover:text-primary transition-colors duration-300">About</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Speakers</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Matchmaking</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Partnerships</a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
