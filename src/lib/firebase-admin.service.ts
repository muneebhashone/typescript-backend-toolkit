import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../firebase-adminsdk-creds.json';

const fbAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default fbAdmin;
