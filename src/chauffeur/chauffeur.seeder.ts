import Chauffeur from './chauffeur.model'; // Adjust the import to your model location

const seedChauffeurs = async () => {
  const chauffeurs = [
    {
      firstName: 'John',
      lastName: 'Doe',
      chauffeurName: 'John Doe',
      phoneNo: '1234518810',
      photo: 'https://example.com/photos/john-doe.jpg',
      idFront: 'https://example.com/id/front.jpg',
      idBack: 'https://example.com/id/back.jpg',
      verificationPhoto: 'https://example.com/verification.jpg',
      availabilityStatus: 'available',
      vendorId: '64b32ef1d4d0f7e0e2a4f4d3',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      chauffeurName: 'Jane Smith',
      phoneNo: '1234518811',
      photo: 'https://example.com/photos/jane-smith.jpg',
      idFront: 'https://example.com/id/front2.jpg',
      idBack: 'https://example.com/id/back2.jpg',
      verificationPhoto: 'https://example.com/verification2.jpg',
      availabilityStatus: 'available',
      vendorId: '64b32ef1d4d0f7e0e2a4f4d3',
    },
    {
      firstName: 'Robert',
      lastName: 'Brown',
      chauffeurName: 'Robert Brown',
      phoneNo: '1234518812',
      photo: 'https://example.com/photos/robert-brown.jpg',
      idFront: 'https://example.com/id/front3.jpg',
      idBack: 'https://example.com/id/back3.jpg',
      verificationPhoto: 'https://example.com/verification3.jpg',
      availabilityStatus: 'available',
      vendorId: '64b32ef1d4d0f7e0e2a4f4d3',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      chauffeurName: 'Emily Davis',
      phoneNo: '1234518813',
      photo: 'https://example.com/photos/emily-davis.jpg',
      idFront: 'https://example.com/id/front4.jpg',
      idBack: 'https://example.com/id/back4.jpg',
      verificationPhoto: 'https://example.com/verification4.jpg',
      availabilityStatus: 'inTransit',
      vendorId: '66b105587e4636d86491315b',
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      chauffeurName: 'Michael Johnson',
      phoneNo: '1234518814',
      photo: 'https://example.com/photos/michael-johnson.jpg',
      idFront: 'https://example.com/id/front5.jpg',
      idBack: 'https://example.com/id/back5.jpg',
      verificationPhoto: 'https://example.com/verification5.jpg',
      availabilityStatus: 'available',
      vendorId: '66b105587e4636d86491315b',
    },
  ];

  try {
    await Chauffeur.deleteMany({});
    await Chauffeur.insertMany(chauffeurs);
    console.log('Chauffeurs seeded successfully');
  } catch (err) {
    console.error('Error seeding chauffeurs:', err);
  }
};

export default seedChauffeurs;
