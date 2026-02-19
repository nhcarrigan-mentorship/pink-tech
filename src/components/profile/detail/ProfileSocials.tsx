import LazyIcon from "../../ui/LazyIcon";

const socialClassName = "w-5 h-5 text-pink-600";

export const socials = [
  {
    key: "linkedin",
    label: "Linkedin",
    placeholder: "https://www.linkedin.com/in/username",
    icon: <LazyIcon name="Linkedin" className={socialClassName} />,
  },
  {
    key: "twitter",
    label: "Twitter",
    placeholder: "@yourusername",
    icon: <LazyIcon name="Twitter" className={socialClassName} />,
  },
  {
    key: "website",
    label: "website",
    placeholder: "https://yourwebsite.com",
    icon: <LazyIcon name="Globe" className={socialClassName} />,
  },
];
