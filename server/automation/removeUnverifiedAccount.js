import cron from "node-cron";
import { User } from "../models/userModel.js";


export const removeUnverifiedAccounts = ()=>{
    cron.schedule(" */30 * * * * ",async () => {
        const thirthyMinuteAge = new Date.now() - 30 *60*1000;
       await User.deleteMany({
            accountVerified:false,
            Created_at: {$lt:thirthyMinuteAge},
        });
    });
};