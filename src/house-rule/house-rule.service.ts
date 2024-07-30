import { HouseRule } from '../models/apartment';
import { HouseRulesType } from '../types';

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

// export const createHouseRule = async (
//   body: HouseRuleCreateOrUpdateSchemaType,
// ): Promise<HouseRulesType | Error> => {
//   try {
//     const newHouseRule = await db
//       .insert(houseRules)
//       .values({ ...body })
//       .returning()
//       .execute();

//     return newHouseRule[0];
//   } catch (_) {
//     return new Error('Error creating house rule');
//   }
// };

// export const updateHouseRule = async (
//   payload: HouseRuleCreateOrUpdateSchemaType,
//   houseRuleId: HouseRuleIdSchemaType,
// ): Promise<HouseRulesType> => {
//   const { id } = houseRuleId;
//   const houseRule = await db.query.houseRules.findFirst({
//     where: eq(houseRules.id, id),
//   });

//   if (!houseRule) {
//     throw new Error('house rule not found');
//   }

//   const updatedHouseRule = await db
//     .update(houseRules)
//     .set({ ...payload })
//     .where(eq(houseRules.id, id))
//     .returning()
//     .execute();

//   return updatedHouseRule[0];
// };

// export const deleteHouseRule = async (houseRuleId: number): Promise<void> => {
//   await db.delete(houseRules).where(eq(houseRules.id, houseRuleId));
// };
