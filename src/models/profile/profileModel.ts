import mongoose, { Document, Schema } from "mongoose";

export interface IPermission {
  create: boolean;
  view: boolean;
  edit: boolean;
}

export interface IProfile extends Document {
  profileName: string;
  status: boolean;
  permission: {
    leads: IPermission;
    users: IPermission;
    calls: IPermission;
    profile: IPermission;
    Complaint:IPermission;
  };
}

const PermissionSchema = new Schema<IPermission>(
  {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
  },
  {
    _id: false,
  }
);

const ProfileSchema = new Schema<IProfile>(
  {
    profileName: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true, required: true },
    permission: {
      leads: { type: PermissionSchema, required: true },
      users: { type: PermissionSchema, required: true },
      calls: { type: PermissionSchema, required: true },
      profile: { type: PermissionSchema, required: true },
      Complaint: { type: PermissionSchema, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const ProfileModel = mongoose.model<IProfile>("Profile", ProfileSchema);

export default ProfileModel;
