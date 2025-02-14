import Close from '@material-ui/icons/Close';
import * as classnames from 'classnames';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    borderRadius: 1,
    marginBottom: theme.spacing(),
    padding: '12px 18px',
    '& p': {
      fontSize: '1rem',
      marginLeft: theme.spacing(),
    },
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
    color: theme.cmrTextColors.tableStatic,
    marginLeft: 20,
  },
  productInformationIndicator: {
    borderLeft: `solid 6px ${theme.color.green}`,
  },
}));

interface Props {
  preferenceKey: string;
  children: JSX.Element;
  className?: string;
  productInformationIndicator?: boolean;
}

export const DismissibleBanner: React.FC<Props> = (props) => {
  const { className, preferenceKey, productInformationIndicator } = props;
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();
  const classes = useStyles();

  if (hasDismissedNotifications([preferenceKey])) {
    return null;
  }

  const handleDismiss = () => {
    dismissNotifications([preferenceKey]);
  };

  return (
    <Paper
      className={classnames(
        {
          [classes.root]: true,
          [classes.productInformationIndicator]: productInformationIndicator,
        },
        className
      )}
    >
      {props.children}
      <button
        aria-label={`Dismiss ${preferenceKey} banner`}
        className={classes.button}
        onClick={handleDismiss}
      >
        <Close />
      </button>
    </Paper>
  );
};

export default DismissibleBanner;
