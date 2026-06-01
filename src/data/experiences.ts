export type StaticExperience = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  category: string;
  galleryImages?: string[];
};

export const STATIC_EXPERIENCES: StaticExperience[] = [
  {
    id: 'walk-in-village',
    title: 'A Walk in the Village',
    description: `Here is an opportunity to offer a new experience to our visitors to Sri Lanka. "A Walk in the Village" is an inspiring and soul-searching activity. We are proud to share with our visitors the authentic life of a rural family. Unlike the common routine visits to tourist attractions, "A Walk in the Village" will allow our foreign guests to understand the way of life of our rural community, its culture and family situations. The positive feedback from our past visits, have inspired us to further enhance this activity to provide a great new experience to our visitors from overseas.`,
    imageId: 'experience-hike',
    category: 'CULTURAL',
    galleryImages: [
      '/experiences/1/ttd_awitv_2-685x1024.jpg',
      '/experiences/1/ttd_awitv_3.jpg',
      '/experiences/1/ttd_awitv_5-685x1024.jpg',
      '/experiences/1/ttd_awitv_6.jpg',
      '/experiences/1/ttd_awitv_7.jpg',
    ]
  },
  {
    id: 'culinary-tourism',
    title: 'Culinary Tourism',
    description: `At Oruthota Chalets we offer "Tourism with a Difference"!! Taking into advantage the picturesque tranquillity that surrounds the Resort, we offer activities with a difference. Our objective is for our guests to leave Sri Lanka with lasting memories of a different touristic nature. We strongly encourage our guests to blend into the culture and experience a typical Allocentric-type of vacation, as compared to the common Psychocentric-type of travellers.

Oruthota Chalets boasts of a 5 acre landscape surrounded with magnificent scenery as well as a waterfront setting during particular months of the year. Our open restaurant creates the right ambiance to offer our valuable guests a bit of culinary tourism. We suggest that just one hour be set apart from their busy schedule to learn to prepare a typical Sri Lankan dish of their choice. It will be ideal to choose a local product that is available in their home country, so that this experience could be repeated, enjoyed and shared with their families, friends and loved ones. Thus spreading our experience to others, who might be inspired to visit our beautiful island, Sri Lanka.

Cookery demonstrations are a very popular activity at Oruthota Chalets. It is now a popular request from leading International schools in Sri Lanka who make their annual trip to our Resort. Our dedicated Staff is always prepared to demonstrate a simple dish to interested guests on request, even on short notice.`,
    imageId: 'experience-food',
    category: 'CULINARY',
    galleryImages: [
      '/experiences/2/1.JPG',
      '/experiences/2/2.JPG',
      '/experiences/2/3.JPG',
      '/experiences/2/4.JPG',
      '/experiences/2/5.JPG',
    ]
  },
  {
    id: 'rural-activities',
    title: 'A Feel to Typical Rural Activities: Weaving of Coconut Palms',
    description: `Most roofs of rural homes are thatched with coconut palms. In certain areas of the country rural folk would even build their entire homes with thatched coconut palms, it is very common in fishing areas. It is an interesting weave that is done on the fresh (green) leaves, and serves as a cover to roofs and walls of homes. Visitors enjoy trying out this activity. This can be a morning program after breakfast, in the large garden area of Oruthota Chalets, visitors will be taught how to weave a coconut palm. Individual attention will be given to every visitor until they get familiar with this art. This is a wonderful experience and memory to take back home.`,
    imageId: 'accommodation-2',
    category: 'TRADITIONAL',
    galleryImages: [
      '/experiences/3/474177944_1189614085898449_1430028404525991780_n.jpg',
      '/experiences/3/474144798_1189613685898489_1988140828303246620_n.jpg',
      '/experiences/3/ttd_fwcp_1.jpg',
      '/experiences/3/ttd_fwcp_4.jpg',
      '/experiences/3/ttd_fwcp_5.jpg',
    ]
  },
  {
    id: 'day-by-river',
    title: 'A Day by the River',
    description: `Here is an opportunity to offer another new experience to our visitors to Sri Lanka – "A Day by the River" with the experience of a river bath. Tourism is not limited to sightseeing; an authentic psychocentric tourist will always wish to experience the typical culture of a destination. We are proud to share with our visitors the authentic life of a rural family. Many of our humble village folk enjoy a river bath after a day’s work is done. People bathing and washing clothes at a river is a common sight around Sri Lanka. This unique activity will give our foreign guests an opportunity to experience this common ritual of our rural folk.`,
    imageId: 'accommodation-3',
    category: 'LEISURE',
    galleryImages: [
      '/experiences/4/ttd_dbtr_1.jpg',
      '/experiences/4/ttd_dbtr_4.jpg',
      '/experiences/4/ttd_dbtr_6.jpg',
      '/experiences/4/ttd_dbtr_7.jpg',
      '/experiences/4/ttd_dbtr_8.jpg',
    ]
  },
  {
    id: 'veddha-village',
    title: 'Visit to the Veddha Village',
    description: `(Home of the Indigenous people of Sri Lanka)\nThis activity has two options:\n\n1. A day excursion to the village of the Veddha people in Dambana\n2. A visit by a couple of the Veddha people to Oruthota Chalets\n\nThe 1st option will require a whole day with a pack lunch. The village is located about 72 kilometers from Oruthota Chalets. The tour is unique to all visitors as they experience the authentic life of an indigenous Sri Lankan – the veddha. The visit begins with a welcome from the Veddha Chieftain at his humble abode. He will talk about his clan and their lifestyles. They use a dialect unique to their community. Translators are available for day excursions. Thereafter, the visitors will be taken into the jungles to see what they do for a living. How they haunt for food, how they make traps for animals, various rituals etc. will be included.`,
    imageId: 'experience-shooting',
    category: 'HERITAGE',
    galleryImages: [
      '/experiences/5/ttd_vv_1.jpg',
      '/experiences/5/ttd_vv_13.jpg',
      '/experiences/5/ttd_vv_2.jpg',
      '/experiences/5/ttd_vv_6.jpg',
      '/experiences/5/ttd_vv_9.jpg',
    ]
  },
  {
    id: 'knuckles-trek',
    title: 'Trek to the Knuckles Mountain Range',
    description: `With an overnight camp (optional).\nKnuckles Mountain Range received its UNESCO World Heritage Site Inscription in 2010, and is a popular eco-tourism venue. It has also been declared as a conservation area, and known as the Knuckles National Heritage and Wilderness area. This is a "must visit" location for nature lovers and the adventurous tourist.`,
    imageId: 'accommodation-1',
    category: 'ADVENTURE',
    galleryImages: [
      '/experiences/6/1.jpeg',
      '/experiences/6/2.jpeg',
      '/experiences/6/3.jpeg',
      '/experiences/6/4.jpeg',
      '/experiences/6/5.jpeg',
    ]
  },
  {
    id: 'meemure-trek',
    title: 'Trek to the Meemure Village',
    description: `With an overnight camp (optional).\nMeemure is one of the most remote villages in Sri Lanka with the only access of about a 14 kilometer trail from its ajacent village called Loolwatte. The village is renowned for its scenic beauty and beautiful waterways. The residents depend on a number of staple crops as their income and mode of existence. A day trip will include all the beautiful locations found in the village. The more adventurous visitor can opt for an overnight camp at this picturesque village in the mountains, amidst lush greenery and maybe beside the calm river that winds its way along the village and down the mountain slopes.`,
    imageId: 'experience-atv',
    category: 'ADVENTURE',
    galleryImages: [
      '/experiences/7/ttd_tmv_11.jpg',
      '/experiences/7/ttd_tmv_4.jpg',
      '/experiences/7/ttd_tmv_6.jpg',
      '/experiences/7/ttd_tmv_8.jpg',
      '/experiences/7/ttd_tmv_9.jpg',
    ]
  },
  {
    id: 'madaram-nuwara',
    title: 'Visit the Village of Madaram Nuwara',
    description: `Madaram Nuwara is a small village situated at the foot of the Pidurutalagala Mountain. It's a hidden gem in Sri Lanka, surrounded by lush green mountains and misty landscapes. The village is famous for its waterfalls and agriculture, primarily tea and vegetables. Exploring Madaram Nuwara offers a peaceful escape and a chance to experience the authentic rural life of the Sri Lankan hill country.`,
    imageId: 'experience-hike',
    category: 'CULTURAL',
    galleryImages: [
      '/experiences/8/ttd_vmn_1.jpg',
      '/experiences/8/ttd_vmn_3.jpg',
      '/experiences/8/ttd_vmn_4.jpg',
      '/experiences/8/ttd_vmn_7.jpg',
      '/experiences/8/ttd_vmn_8.jpg',
    ]
  },
  {
    id: 'cultural-dance',
    title: 'Cultural Dance with a Special Cause',
    description: `Oruthota Chalets offers this activity with pride. This dance is performed by students and their Dance Master from a local school in the neighborhood. These children have no opportunity to show their talents, as they cannot compete with those who hold the monopoly of this art in the bigger cities.`,
    imageId: 'accommodation-2',
    category: 'CULTURAL',
    galleryImages: [
      '/experiences/9/ttd_cd_1.jpg',
      '/experiences/9/ttd_cd_10.jpg',
      '/experiences/9/ttd_cd_11.jpg',
      '/experiences/9/ttd_cd_15.jpg',
      '/experiences/9/ttd_cd_5.jpg',
    ]
  },
];
