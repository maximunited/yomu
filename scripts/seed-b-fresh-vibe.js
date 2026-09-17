// B-FRESH VIBE loyalty club seed data
const brand = {
  name: 'B-FRESH',
  clubName: 'VIBE Loyalty Club',
  clubNameHe: 'מועדון VIBE',
  registrationFeeIls: 50,
  lifetimeMembership: true,
  signupLocation: 'Physical B-FRESH retail branches',
  benefits: [
    {
      type: 'signup',
      title: 'Free drink on signup',
      description:
        'One free drink of any size, including Size L and premium/Limited Edition series. A 50% off Size M coupon is provisioned 24 hours after registration.',
    },
    {
      type: 'birthday',
      title: 'Birthday drink',
      description:
        'One free Size M drink during the member’s birthday month, recurring annually for the lifetime of the account.',
    },
    {
      type: 'points',
      title: '10% cashback points',
      description:
        '10% of gross standard-menu purchases is converted into redeemable points.',
    },
    {
      type: 'member_discount',
      title: 'Monthly member discounts',
      description:
        'Exclusive monthly discounts of 20%–25% on selected items, seasonal products, or new flavors.',
    },
  ],
  termsNote:
    'Refer to the official B-FRESH Membership Terms & Conditions for exclusions and complete details.',
};

module.exports = { brand };
