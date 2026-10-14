import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type GlossyButtonTheme = 'brand' | 'orange' | 'violet' | 'sky' | 'emerald';

type GlossyButtonVisualProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
  pill?: boolean;
  theme?: GlossyButtonTheme;
};

type GlossyLinkProps = GlossyButtonVisualProps &
  Omit<ComponentProps<typeof Link>, keyof GlossyButtonVisualProps | 'className'>;
type GlossyNativeButtonProps = GlossyButtonVisualProps &
  Omit<ComponentProps<'button'>, keyof GlossyButtonVisualProps | 'className'>;
type GlossyButtonProps = GlossyLinkProps | GlossyNativeButtonProps;

export function GlossyButton(props: GlossyButtonProps) {
  const {
    children,
    className = '',
    fullWidth = false,
    compact = false,
    pill = false,
    theme = 'brand',
    ...elementProps
  } = props;
  const classes = [
    'glossy-button',
    `glossy-button--${theme}`,
    fullWidth && 'glossy-button--full',
    compact && 'glossy-button--compact',
    pill && 'glossy-button--pill',
    className,
  ].filter(Boolean).join(' ');
  const content = (
    <>
      <span aria-hidden="true" className="glossy-button__glow" />
      <span className="glossy-button__inner">{children}</span>
    </>
  );

  if ('href' in elementProps) {
    return (
      <Link className={classes} {...elementProps}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...elementProps}
      type={elementProps.type ?? 'button'}
    >
      {content}
    </button>
  );
}
