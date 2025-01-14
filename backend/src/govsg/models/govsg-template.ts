import { Campaign } from '@core/models'
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript'
import { CampaignGovsgTemplate } from './campaign-govsg-template'

// There will only be either one of these 2 fields for every param as:
//   - displayName is for showing field name on form for users to fill
//   - defaultFromMetaField is for taking values from user_experimental metadata
export type GovsgTemplateParamMetadata = {
  displayName?: string
  defaultFromMetaField?: string
}

@Table({ tableName: 'govsg_templates', underscored: true, timestamps: true })
export class GovsgTemplate extends Model<GovsgTemplate> {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @BelongsToMany(() => Campaign, {
    through: { model: () => CampaignGovsgTemplate },
  })
  campaigns: Array<Campaign>

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  body: string

  // not sure about this — should we not accept null and use empty array instead? I think null is more elegant
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  params: Array<string> | null

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  paramMetadata: Record<string, GovsgTemplateParamMetadata> | null

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  whatsappTemplateLabel: string | null

  @Column({
    type: DataType.TEXT,
  })
  name: string
}
