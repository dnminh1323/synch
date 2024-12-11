import { Controller, Get, Query, Res, Post, Body, Param } from '@nestjs/common';
import { Response } from 'express';
import { GoogleAuthProvider } from './providers/google-auth.provider';
import { GoogleSheetService } from './providers/google-sheet.service';
import { GoogleSheetServiceFactory } from './providers/google-sheet.factory';
import { GoogleSheetConfig } from './interfaces/google-sheet-config.interface';
import { UsersService } from '../database/users/users.service';

/**
 * Controller để xử lý xác thực Google OAuth2.
 */
@Controller(':domain/google-sheet')
export class GoogleSheetController {
    constructor(
        private readonly googleAuthProvider: GoogleAuthProvider,
        private readonly googleSheetServiceFactory: GoogleSheetServiceFactory,
        private readonly usersService: UsersService,
    ) {}

    @Post('create')
    async createSpreadsheet(
        @Param('domain') domain: string,
        @Body('title') title: string,
        @Body('config') config: GoogleSheetConfig,
    ) {
        const googleSheetService = this.googleSheetServiceFactory.createService(config, this.usersService);
        return await googleSheetService.createSpreadsheet(title, domain);
    }
}
