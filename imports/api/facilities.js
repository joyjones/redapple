/**
 * Created by jones on 16/5/15.
 */
import { Mongo } from 'meteor/mongo';

export const Facilities = new Mongo.Collection('facilities');
export const FacilityTypes = new Mongo.Collection('facility_type');
