import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = () => {
  return (
    <footer className="bg-white min-h-20 py-4 md:py-0 relative">
      <MaxWidthWrapper>
        <div className="border-t border-gray-200" />

        <div className="h-full flex flex-col md:flex-row md:justify-between justify-center items-center gap-3 md:gap-0 pt-4 md:pt-0 md:h-20">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
