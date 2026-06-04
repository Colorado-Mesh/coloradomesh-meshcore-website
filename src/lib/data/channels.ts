import {UPSTREAM_UTILITIES_CHANNELS, UpstreamChannel} from '@/lib/upstream-utilities';

export interface Channel {
    name: string;
    description: string;
    order: number;
    key: string;
    url: string;
    image_uri: string;
}

function getImageUri(channel: UpstreamChannel) {
    const cleanChannelName = channel.name.replace('#', '');
    return '/channels/meshcore_channel_' + channel.order + '_' + cleanChannelName + '.png';
}

export const channels: Channel[] = UPSTREAM_UTILITIES_CHANNELS
    .map((channel) => ({
        name: channel.name,
        description: channel.description,
        order: channel.order,
        key: channel.key,
        url: channel.url,
        image_uri: getImageUri(channel),
    }))
    .sort((a, b) => a.order - b.order);
