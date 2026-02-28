import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center"
    >
      <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground mt-2">Страница не найдена</p>
      <Link href="/">
        <Button className="mt-6 rounded-xl">На биржу</Button>
      </Link>
    </motion.div>
  );
}
