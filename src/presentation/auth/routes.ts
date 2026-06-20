import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from '../services/auth.service';




export class Authroutes {


  static get routes(): Router {

    const router = Router();
    const authService = new AuthService();

    const controller = new AuthController(authService);
    
    // Definir las rutas
    router.post('/login', controller.loginUser );



    return router;
  }


}
