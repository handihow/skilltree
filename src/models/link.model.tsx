import { IconPrefix , IconName } from '@fortawesome/fontawesome-svg-core';

export default interface ILink {
    id: string;
    iconName: IconName;
    iconPrefix: IconPrefix;
    reference: string;
    title: string;
    description?: string;
    imageUrl?: string;
    filename?: string;
}
