import { isDEV, isPROD } from './env';

/**
 * API Configuration
 * Template placeholder - configure for your project
 */

// API URLs - replace with your API endpoints
const DevApiURL = 'http://localhost:3001/api';
const StagingApiURL = 'https://api-staging.example.com';
const ProdApiURL = 'https://api.example.com';

export const ApiURL = isDEV ? DevApiURL : isPROD ? ProdApiURL : StagingApiURL;

// Base URLs - replace with your app URLs
const DevBaseUrl = 'http://localhost:3000';
const StagingBaseUrl = 'https://staging.example.com';
const ProdBaseUrl = 'https://example.com';

export const BaseUrl = isDEV ? DevBaseUrl : isPROD ? ProdBaseUrl : StagingBaseUrl;
