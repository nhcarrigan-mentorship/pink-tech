import LazyIcon from "../../ui/LazyIcon";

const socialClassName = "w-5 h-5 text-pink-600";

export const socials = [
  {
    key: "linkedin",
    label: "Linkedin",
    icon: <LazyIcon name="Linkedin" className={socialClassName} />,
  },
  {
    key: "twitter",
    label: "Twitter",
    icon: <LazyIcon name="Twitter" className={socialClassName} />,
  },
  {
    key: "website",
    label: "website",
    icon: <LazyIcon name="Globe" className={socialClassName} />,
  },
];
