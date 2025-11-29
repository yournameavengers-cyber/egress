/**
 * Cancellation link database for common services
 * Maps service names (case-insensitive, fuzzy) to their cancellation URLs
 */

interface CancellationLink {
  service: string;
  url: string;
  aliases?: string[]; // Alternative names for the service
}

const cancellationLinks: CancellationLink[] = [
  {
    service: 'netflix',
    url: 'https://www.netflix.com/account',
    aliases: ['netflix.com', 'netflix streaming']
  },
  {
    service: 'spotify',
    url: 'https://www.spotify.com/account/subscription/',
    aliases: ['spotify premium']
  },
  {
    service: 'amazon prime',
    url: 'https://www.amazon.com/mc/account/manage-memberships-and-subscriptions',
    aliases: ['prime', 'amazon prime video', 'prime video', 'amazon']
  },
  {
    service: 'disney plus',
    url: 'https://www.disneyplus.com/account',
    aliases: ['disney+', 'disneyplus', 'disney plus streaming']
  },
  {
    service: 'hulu',
    url: 'https://help.hulu.com/s/article/cancel-subscription',
    aliases: ['hulu plus']
  },
  {
    service: 'apple music',
    url: 'https://support.apple.com/en-us/HT202039',
    aliases: ['apple music subscription']
  },
  {
    service: 'youtube premium',
    url: 'https://www.youtube.com/paid_memberships',
    aliases: ['youtube red', 'youtube music premium']
  },
  {
    service: 'adobe',
    url: 'https://www.adobe.com/account/cancel-subscription.html',
    aliases: ['adobe creative cloud', 'adobe cc']
  },
  {
    service: 'microsoft 365',
    url: 'https://account.microsoft.com/services',
    aliases: ['office 365', 'microsoft office', 'office subscription']
  },
  {
    service: 'dropbox',
    url: 'https://www.dropbox.com/account/billing',
    aliases: ['dropbox plus', 'dropbox professional']
  },
  {
    service: 'notion',
    url: 'https://www.notion.so/help/cancel-your-subscription',
    aliases: ['notion.so']
  },
  {
    service: 'figma',
    url: 'https://www.figma.com/settings/billing',
    aliases: ['figma professional']
  },
  {
    service: 'canva',
    url: 'https://www.canva.com/account/billing',
    aliases: ['canva pro']
  },
  {
    service: 'grammarly',
    url: 'https://www.grammarly.com/settings',
    aliases: ['grammarly premium']
  },
  {
    service: 'linkedin',
    url: 'https://www.linkedin.com/psettings/premium',
    aliases: ['linkedin premium']
  },
  {
    service: 'audible',
    url: 'https://www.audible.com/account/cancel-membership',
    aliases: ['amazon audible']
  },
  {
    service: 'twitch',
    url: 'https://www.twitch.tv/settings/subscriptions',
    aliases: ['twitch prime', 'twitch turbo']
  },
  {
    service: 'discord',
    url: 'https://discord.com/settings/subscriptions',
    aliases: ['discord nitro']
  },
  {
    service: 'github',
    url: 'https://github.com/settings/billing',
    aliases: ['github pro', 'github team']
  },
  {
    service: 'slack',
    url: 'https://slack.com/account/settings',
    aliases: ['slack workspace']
  },
  // Streaming Services
  {
    service: 'hbo max',
    url: 'https://www.hbomax.com/account',
    aliases: ['hbo', 'max', 'hbo max streaming']
  },
  {
    service: 'paramount plus',
    url: 'https://www.paramountplus.com/account',
    aliases: ['paramount+', 'paramount', 'cbs all access']
  },
  {
    service: 'peacock',
    url: 'https://www.peacocktv.com/account',
    aliases: ['nbc peacock', 'peacock tv']
  },
  {
    service: 'apple tv plus',
    url: 'https://tv.apple.com/account',
    aliases: ['apple tv', 'apple tv+']
  },
  {
    service: 'showtime',
    url: 'https://www.showtime.com/account',
    aliases: ['showtime anytime']
  },
  {
    service: 'starz',
    url: 'https://www.starz.com/account',
    aliases: ['starzplay']
  },
  {
    service: 'crunchyroll',
    url: 'https://www.crunchyroll.com/account',
    aliases: ['crunchyroll premium']
  },
  {
    service: 'fubo',
    url: 'https://www.fubo.tv/account',
    aliases: ['fubotv', 'fubo tv']
  },
  {
    service: 'sling',
    url: 'https://www.sling.com/account',
    aliases: ['sling tv']
  },
  // Music Services
  {
    service: 'apple music',
    url: 'https://support.apple.com/en-us/HT202039',
    aliases: ['itunes music', 'apple music subscription']
  },
  {
    service: 'tidal',
    url: 'https://tidal.com/account',
    aliases: ['tidal hifi']
  },
  {
    service: 'pandora',
    url: 'https://www.pandora.com/account',
    aliases: ['pandora plus', 'pandora premium']
  },
  {
    service: 'deezer',
    url: 'https://www.deezer.com/account',
    aliases: ['deezer premium']
  },
  // Software & Productivity
  {
    service: 'microsoft 365',
    url: 'https://account.microsoft.com/services',
    aliases: ['office 365', 'microsoft office', 'office subscription']
  },
  {
    service: 'adobe',
    url: 'https://www.adobe.com/account/cancel-subscription.html',
    aliases: ['adobe creative cloud', 'adobe cc', 'photoshop', 'premiere pro']
  },
  {
    service: 'autodesk',
    url: 'https://accounts.autodesk.com/',
    aliases: ['autocad', 'maya', '3ds max']
  },
  {
    service: 'notion',
    url: 'https://www.notion.so/help/cancel-your-subscription',
    aliases: ['notion.so']
  },
  {
    service: 'obsidian',
    url: 'https://obsidian.md/account',
    aliases: ['obsidian sync']
  },
  {
    service: 'roam research',
    url: 'https://roamresearch.com/account',
    aliases: ['roam']
  },
  {
    service: 'evernote',
    url: 'https://www.evernote.com/AccountSettings.action',
    aliases: ['evernote premium']
  },
  {
    service: 'onenote',
    url: 'https://account.microsoft.com/services',
    aliases: []
  },
  // Cloud Storage
  {
    service: 'dropbox',
    url: 'https://www.dropbox.com/account/billing',
    aliases: ['dropbox plus', 'dropbox professional']
  },
  {
    service: 'google drive',
    url: 'https://one.google.com/storage',
    aliases: ['google one', 'google storage']
  },
  {
    service: 'icloud',
    url: 'https://www.icloud.com/settings/',
    aliases: ['apple icloud', 'icloud storage']
  },
  {
    service: 'onedrive',
    url: 'https://account.microsoft.com/services',
    aliases: ['microsoft onedrive']
  },
  {
    service: 'pcloud',
    url: 'https://www.pcloud.com/account',
    aliases: ['pcloud premium']
  },
  // Design & Creative
  {
    service: 'figma',
    url: 'https://www.figma.com/settings/billing',
    aliases: ['figma professional']
  },
  {
    service: 'canva',
    url: 'https://www.canva.com/account/billing',
    aliases: ['canva pro']
  },
  {
    service: 'adobe stock',
    url: 'https://www.adobe.com/account/cancel-subscription.html',
    aliases: []
  },
  {
    service: 'shutterstock',
    url: 'https://www.shutterstock.com/account',
    aliases: ['shutterstock subscription']
  },
  // Communication & Social
  {
    service: 'linkedin',
    url: 'https://www.linkedin.com/psettings/premium',
    aliases: ['linkedin premium']
  },
  {
    service: 'discord',
    url: 'https://discord.com/settings/subscriptions',
    aliases: ['discord nitro']
  },
  {
    service: 'slack',
    url: 'https://slack.com/account/settings',
    aliases: ['slack workspace']
  },
  {
    service: 'zoom',
    url: 'https://zoom.us/account',
    aliases: ['zoom pro', 'zoom business']
  },
  {
    service: 'teams',
    url: 'https://admin.microsoft.com/Adminportal/Home',
    aliases: ['microsoft teams']
  },
  // Gaming
  {
    service: 'playstation plus',
    url: 'https://www.playstation.com/en-us/account/',
    aliases: ['ps plus', 'playstation network', 'psn']
  },
  {
    service: 'xbox game pass',
    url: 'https://account.microsoft.com/services',
    aliases: ['xbox live', 'game pass', 'xbox gold']
  },
  {
    service: 'nintendo switch online',
    url: 'https://accounts.nintendo.com/',
    aliases: ['nintendo online', 'switch online']
  },
  {
    service: 'steam',
    url: 'https://store.steampowered.com/account/',
    aliases: []
  },
  {
    service: 'twitch',
    url: 'https://www.twitch.tv/settings/subscriptions',
    aliases: ['twitch prime', 'twitch turbo']
  },
  // Fitness & Health
  {
    service: 'peloton',
    url: 'https://www.onepeloton.com/account',
    aliases: ['peloton app']
  },
  {
    service: 'strava',
    url: 'https://www.strava.com/account',
    aliases: ['strava premium']
  },
  {
    service: 'myfitnesspal',
    url: 'https://www.myfitnesspal.com/account',
    aliases: ['mfp premium']
  },
  {
    service: 'calm',
    url: 'https://www.calm.com/account',
    aliases: ['calm app']
  },
  {
    service: 'headspace',
    url: 'https://www.headspace.com/account',
    aliases: ['headspace app']
  },
  // News & Reading
  {
    service: 'new york times',
    url: 'https://www.nytimes.com/subscription',
    aliases: ['nytimes', 'ny times', 'new york times subscription']
  },
  {
    service: 'washington post',
    url: 'https://www.washingtonpost.com/subscriptions/',
    aliases: ['wapo', 'washington post subscription']
  },
  {
    service: 'wall street journal',
    url: 'https://account.wsj.com/',
    aliases: ['wsj', 'wall street journal subscription']
  },
  {
    service: 'kindle unlimited',
    url: 'https://www.amazon.com/kindle-dbs/hz/signup',
    aliases: ['kindle', 'amazon kindle']
  },
  {
    service: 'audible',
    url: 'https://www.audible.com/account/cancel-membership',
    aliases: ['amazon audible']
  },
  // Food & Delivery
  {
    service: 'doordash',
    url: 'https://www.doordash.com/account',
    aliases: ['doordash dashpass']
  },
  {
    service: 'uber eats',
    url: 'https://www.ubereats.com/account',
    aliases: ['ubereats pass']
  },
  {
    service: 'instacart',
    url: 'https://www.instacart.com/account',
    aliases: ['instacart express']
  },
  // Shopping
  {
    service: 'amazon prime',
    url: 'https://www.amazon.com/mc/account/manage-memberships-and-subscriptions',
    aliases: ['prime', 'amazon prime video', 'prime video', 'amazon']
  },
  {
    service: 'costco',
    url: 'https://www.costco.com/account',
    aliases: ['costco membership']
  },
  {
    service: 'walmart plus',
    url: 'https://www.walmart.com/account',
    aliases: ['walmart+', 'walmart plus membership']
  },
  // Developer Tools
  {
    service: 'github',
    url: 'https://github.com/settings/billing',
    aliases: ['github pro', 'github team']
  },
  {
    service: 'gitlab',
    url: 'https://gitlab.com/-/profile/subscriptions',
    aliases: ['gitlab premium']
  },
  {
    service: 'jetbrains',
    url: 'https://account.jetbrains.com/',
    aliases: ['intellij', 'webstorm', 'pycharm']
  },
  {
    service: 'sublime text',
    url: 'https://www.sublimetext.com/account',
    aliases: ['sublime']
  },
  // VPN & Security
  {
    service: 'nordvpn',
    url: 'https://my.nordaccount.com/',
    aliases: ['nord vpn']
  },
  {
    service: 'expressvpn',
    url: 'https://www.expressvpn.com/account',
    aliases: ['express vpn']
  },
  {
    service: 'surfshark',
    url: 'https://surfshark.com/account',
    aliases: ['surfshark vpn']
  },
  {
    service: '1password',
    url: 'https://1password.com/account',
    aliases: ['1password subscription']
  },
  {
    service: 'lastpass',
    url: 'https://www.lastpass.com/account',
    aliases: ['lastpass premium']
  },
  {
    service: 'dashlane',
    url: 'https://www.dashlane.com/account',
    aliases: ['dashlane premium']
  },
  // Other Popular Services
  {
    service: 'grammarly',
    url: 'https://www.grammarly.com/settings',
    aliases: ['grammarly premium']
  },
  {
    service: 'scribd',
    url: 'https://www.scribd.com/account',
    aliases: ['scribd subscription']
  },
  {
    service: 'masterclass',
    url: 'https://www.masterclass.com/account',
    aliases: ['masterclass subscription']
  },
  {
    service: 'skillshare',
    url: 'https://www.skillshare.com/account',
    aliases: ['skillshare premium']
  },
  {
    service: 'coursera',
    url: 'https://www.coursera.org/account',
    aliases: ['coursera plus']
  }
];

/**
 * Finds a cancellation URL for a service name using fuzzy matching
 * @param serviceName - The service name to search for
 * @returns The cancellation URL, or null if not found
 */
export function findCancellationUrl(serviceName: string): string | null {
  if (!serviceName) return null;

  const normalized = serviceName.toLowerCase().trim();

  // Exact match first
  for (const link of cancellationLinks) {
    if (link.service === normalized) {
      return link.url;
    }
    // Check aliases
    if (link.aliases?.some(alias => alias.toLowerCase() === normalized)) {
      return link.url;
    }
  }

  // Fuzzy match - check if service name contains any of our known services
  for (const link of cancellationLinks) {
    if (normalized.includes(link.service) || link.service.includes(normalized)) {
      return link.url;
    }
    // Check aliases
    if (link.aliases?.some(alias => normalized.includes(alias.toLowerCase()) || alias.toLowerCase().includes(normalized))) {
      return link.url;
    }
  }

  return null;
}

/**
 * Gets a cancellation URL, routing through your domain to prevent spam
 * @param serviceName - The service name
 * @returns The redirect URL (routes through your domain)
 */
export function getCancellationUrl(serviceName: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const encodedService = encodeURIComponent(serviceName);
  return `${appUrl}/api/redirect?service=${encodedService}`;
}

