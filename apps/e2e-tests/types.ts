export interface WebhookManifest {
    name: string;
    targetUrl: string;
    asyncEvents: string[];
    isActive: boolean;
    query: string;
}

export interface Manifest {
    id: string;
    version: string;
    name: string;
    permissions: string[];
    appUrl: string;
    tokenTargetUrl: string;
    webhooks: WebhookManifest[];
}