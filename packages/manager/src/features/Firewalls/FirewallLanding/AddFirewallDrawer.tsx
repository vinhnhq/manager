import { CreateFirewallPayload, Firewall } from '@linode/api-v4/lib/firewalls';
import { CreateFirewallSchema } from '@linode/validation/lib/firewalls.schema';
import { Formik, FormikBag } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer, { DrawerProps } from 'src/components/Drawer';
import LinodeMultiSelect from 'src/components/LinodeMultiSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

export interface Props extends Omit<DrawerProps, 'onClose' | 'onSubmit'> {
  onClose: () => void;
  onSubmit: (payload: CreateFirewallPayload) => Promise<Firewall>;
}

export type FormikProps = FormikBag<CombinedProps, CreateFirewallPayload>;

export type CombinedProps = Props;

const initialValues: CreateFirewallPayload = {
  label: '',
  rules: {
    inbound_policy: 'ACCEPT',
    outbound_policy: 'ACCEPT',
  },
  devices: {
    linodes: [],
  },
};

const AddFirewallDrawer: React.FC<CombinedProps> = (props) => {
  const { onClose, onSubmit, ...restOfDrawerProps } = props;

  /**
   * We'll eventually want to check the read_write firewall
   * grant here too, but it doesn't exist yet.
   */
  const { _isRestrictedUser, _hasGrant } = useAccountManagement();

  const userCannotAddFirewall =
    _isRestrictedUser && !_hasGrant('add_firewalls');

  const submitForm = (
    values: CreateFirewallPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // Clear drawer error state
    setStatus(undefined);
    setErrors({});
    const payload = { ...values };

    if (payload.label === '') {
      payload.label = undefined;
    }

    if (
      Array.isArray(payload.rules.inbound) &&
      payload.rules.inbound.length === 0
    ) {
      payload.rules.inbound = undefined;
    }

    if (
      Array.isArray(payload.rules.outbound) &&
      payload.rules.outbound.length === 0
    ) {
      payload.rules.outbound = undefined;
    }

    onSubmit(payload)
      .then(() => {
        setSubmitting(false);
        onClose();
      })
      .catch((err) => {
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, err);
        handleGeneralErrors(mapErrorToStatus, err, 'Error creating Firewall.');
      });
  };

  const firewallHelperText = `Assign one or more Linodes to this firewall. You can add
  Linodes later if you want to customize your rules first.`;

  return (
    <Drawer {...restOfDrawerProps} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={CreateFirewallSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={submitForm}
      >
        {({
          values,
          errors,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => {
          const generalError =
            status?.generalError ||
            errors['rules.inbound'] ||
            errors['rules.outbound'] ||
            errors.rules;

          return (
            <form onSubmit={handleSubmit}>
              {userCannotAddFirewall ? (
                <Notice
                  error
                  text="You don't have permissions to create a new Firewall. Please contact an account administrator for details."
                />
              ) : null}
              {generalError && (
                <Notice
                  key={status}
                  text={status?.generalError ?? 'An unexpected error occurred'}
                  error
                  data-qa-error
                />
              )}
              <TextField
                aria-label="Label for your new Firewall"
                label="Label"
                disabled={userCannotAddFirewall}
                name="label"
                value={values.label}
                onChange={handleChange}
                errorText={errors.label}
                onBlur={handleBlur}
                inputProps={{
                  autoFocus: true,
                }}
              />
              <LinodeMultiSelect
                showAllOption
                disabled={userCannotAddFirewall}
                helperText={firewallHelperText}
                errorText={errors['devices.linodes']}
                handleChange={(selected: number[]) =>
                  setFieldValue('devices.linodes', selected)
                }
                onBlur={handleBlur}
              />
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  disabled={userCannotAddFirewall}
                  loading={isSubmitting}
                  data-qa-submit
                  data-testid="create-firewall-submit"
                >
                  Create Firewall
                </Button>
                <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
                  Cancel
                </Button>
              </ActionsPanel>
            </form>
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default React.memo(AddFirewallDrawer);
