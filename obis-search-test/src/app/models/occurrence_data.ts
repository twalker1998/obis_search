import { Occurrence } from './occurrence';

export interface OccurrenceData {
    min_date: string;
    max_date: string;
    table: Array<Occurrence>;
}
