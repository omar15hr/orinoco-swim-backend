import path from "path";
import express from "express";

interface Options {
  port: number;
  public_path?: string;
}

export class Server {
  private app = express();
  private readonly port: number;
  private readonly publicPath: string;

  constructor(options: Options) {
    const { port, public_path = "public" } = options;
    this.port = port;
    this.publicPath = public_path;
  }

  async start() {
    // Middlewares

    // Public Folder
    this.app.use(express.static(this.publicPath));

    // Routes
    this.app.get('')
  }
}
