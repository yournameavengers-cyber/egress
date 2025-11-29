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
    url: 'https://www.netflix.com/cancelplan',
    aliases: ['netflix.com', 'netflix streaming']
  },
  {
    service: 'spotify',
    url: 'https://www.spotify.com/account/subscription/',
    aliases: ['spotify premium']
  },
  {
    service: 'amazon prime',
    url: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=G6HXH9LZ4Q8Z8X8Z',
    aliases: ['prime', 'amazon prime video', 'prime video']
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
 * Gets a cancellation URL, falling back to Google search if not found
 * @param serviceName - The service name
 * @returns The cancellation URL (either direct link or Google search)
 */
export function getCancellationUrl(serviceName: string): string {
  const directUrl = findCancellationUrl(serviceName);
  
  if (directUrl) {
    return directUrl;
  }

  // Fallback to Google search
  const searchQuery = encodeURIComponent(`cancel ${serviceName} subscription`);
  return `https://www.google.com/search?q=${searchQuery}`;
}

