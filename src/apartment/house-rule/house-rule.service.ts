import { HouseRule } from '../apartment.model';
import { HouseRulesType } from '../../types';
import {
  HouseRuleCreateOrUpdateSchemaType,
  HouseRuleIdSchemaType,
} from './house-rule.schema';

export const seedHouseRules = async (): Promise<HouseRulesType[]> => {
  await HouseRule.deleteMany({});

  const data = [
    {
      rule: '2 guests maximum.',
    },
    {
      rule: 'No parties or events.',
    },
    {
      rule: 'No smoking allowed.',
    },
    {
      rule: 'No commercial photography',
    },
    {
      rule: 'Suitable for toddlers and children under 12.',
    },
    {
      rule: 'No eating or drinking in bedrooms.',
    },
    {
      rule: 'Please respect check-in and check-out times. ',
    },
    {
      rule: 'Please don’t rearrange the furniture.',
    },
    {
      rule: 'No illegal substances allowed on the premises.',
    },
    {
      rule: 'Please take the trash out before you leave.',
    },
    {
      rule: 'Other',
    },
  ];

  const insertedData = await HouseRule.insertMany(data);

  return insertedData;
};

export const getHouseRule = async (): Promise<HouseRulesType[]> => {
  const houseRule = await HouseRule.find({});

  return houseRule;
};

export const createHouseRule = async (
  body: HouseRuleCreateOrUpdateSchemaType,
): Promise<HouseRulesType | Error> => {
  const newHouseRule = await HouseRule.create({ ...body });
  return newHouseRule;
};

export const updateHouseRule = async (
  payload: HouseRuleCreateOrUpdateSchemaType,
  houseRuleId: HouseRuleIdSchemaType,
): Promise<HouseRulesType> => {
  const { id } = houseRuleId;
  const houseRule = await HouseRule.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
      },
    },
    {
      new: true,
    },
  );

  if (!houseRule) {
    throw new Error('HouseRule not found');
  }

  return houseRule;
};

export const deleteHouseRule = async (
  houseRuleId: HouseRuleIdSchemaType,
): Promise<void> => {
  const { id } = houseRuleId;
  const deleted = await HouseRule.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('HouseRule does not Exist');
  }
};
