import { Trans, useTranslation } from 'react-i18next';

export * from 'react-i18next';

interface Props extends Omit<React.ComponentProps<typeof Trans>, 't' | 'components'> {
  highlight?: string | React.ReactElement;
}

export const Translate: React.FC<Props> = ({ children, ns, highlight, ...props }) => {
  const { t } = useTranslation(ns);
  return (
    <Trans
      t={t}
      {...props}
      components={
        typeof highlight === 'string'
          ? { highlight: <span className={highlight} /> }
          : highlight
            ? { highlight: highlight }
            : undefined
      }
    >
      {children}
    </Trans>
  );
};
