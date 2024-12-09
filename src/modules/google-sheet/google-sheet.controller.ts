import { Controller, Get, Query, Res, Post, Body, Param } from '@nestjs/common';
import { Response } from 'express';
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { GoogleSheetService } from './providers/google-sheet.service';
import { GoogleSheetServiceFactory } from './providers/google-sheet.factory';
import { GoogleSheetConfig } from './interfaces/google-sheet-config.interface';

/**
 * Controller để xử lý xác thực Google OAuth2.
 */
@Controller('google-sheet')
export class GoogleSheetController {
    constructor(
        private readonly googleAuthProvider: GoogleAuthProvider,
        private readonly googleSheetServiceFactory: GoogleSheetServiceFactory,
    ) {}

    @Post('create')
    async createSpreadsheet(
        @Body('title') title: string,
        @Body('config') config: GoogleSheetConfig,
    ) {
        const googleSheetService = this.googleSheetServiceFactory.createService(config);
        return await googleSheetService.createSpreadsheet(title);
    }
}
