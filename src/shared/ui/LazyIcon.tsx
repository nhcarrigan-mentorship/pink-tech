import React, { useEffect, useState } from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { name: string };

export default function LazyIcon({ name, ...props }: IconProps) {
  const [IconComp, setIconComp] =
    useState<React.ComponentType<IconProps> | null>(null);

  useEffect(() => {
    let mounted = true;
    import("lucide-react")
      .then((mod) => {
        const Comp = (mod as any)[name];
        if (mounted && Comp)
          setIconComp(() => Comp as React.ComponentType<IconProps>);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      mounted = false;
    };
  }, [name]);

  if (!IconComp) {
    // Render a placeholder element that preserves layout
    return <span aria-hidden className={props.className} />;
  }
  return <IconComp {...(props as any)} />;
}
