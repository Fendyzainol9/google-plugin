import { serverFunctions } from './serverFunctions';

export const showAlertDialog = async (message: string) => {
  try {
    await serverFunctions.showAlertDialog(message);
  } catch (error) {
    console.log('Error showing alert dialog', error);
  }
};
