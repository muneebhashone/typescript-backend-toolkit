import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../city-link-application-firebase-adminsdk-npczq-e379ddb065.json';

const fbAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export default fbAdmin;
