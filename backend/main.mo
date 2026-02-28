import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

import Text "mo:core/Text";
import List "mo:core/List";


actor {
  type Mod = {
    name : Text;
    description : Text;
    content : [Text];
  };

  type Subject = {
    id : Nat;
    name : Text;
    mods : [Mod];
  };

  type SubjectCategory = {
    name : Text;
    subjects : [Subject];
  };

  type ClassType = {
    name : Text;
  };

  type TimetableEntry = {
    subjectId : Nat;
    subjectName : Text;
    classType : Text;
    category : Text;
    dayOfWeek : Text;
    startTime : Nat;
    duration : Nat;
  };

  // switched var categories from Map to Array to support explicit migration logic
  var categories : [SubjectCategory] = [
    {
      name = "First Year";
      subjects = [
        {
          id = 0;
          name = "Anatomy";
          mods = [
            {
              name = "Gross Anatomy";
              description = "Study of body structures visible to the naked eye";
              content = ["Skeleton", "Muscles", "Organs"];
            },
            {
              name = "Histology";
              description = "Microscopic study of tissues";
              content = ["Cells", "Tissues", "Organelles"];
            },
          ];
        },
        {
          id = 1;
          name = "Physiology";
          mods = [
            {
              name = "Cardiovascular System";
              description = "Study of heart and blood vessels";
              content = ["Heart", "Blood Vessels", "Circulation"];
            },
            {
              name = "Respiratory System";
              description = "Study of breathing and lungs";
              content = ["Lungs", "Alveoli", "Breathing"];
            },
          ];
        },
        {
          id = 2;
          name = "Biochemistry";
          mods = [
            {
              name = "Carbohydrates";
              description = "Study of carbohydrate metabolism";
              content = ["Glucose", "Glycogen", "Glycolysis"];
            },
            {
              name = "Proteins and Enzymes";
              description = "Structure and function of proteins and enzymes";
              content = ["Amino Acids", "Enzymes", "Protein Synthesis"];
            },
          ];
        },
      ];
    },
    {
      name = "Community Medicine First Year";
      subjects = [
        {
          id = 0;
          name = "Community Medicine";
          mods = [
            {
              name = "Epidemiology";
              description = "Study of disease patterns, risk factors, causes, and prevention in populations";
              content = [
                "Definitions and history of public health",
                "Burden of communicable/non-communicable diseases (epidemiology)",
                "Disease prevention models",
                "Economic evaluation in healthcare"
              ];
            },
            {
              name = "Behavioral Sciences";
              description = "Psychology and sociology applied to healthcare";
              content = [
                "Basics of psychology and sociology",
                "Impact of behavior on health",
                "Role of family and society in healthcare"
              ];
            },
            {
              name = "Health Systems";
              description = "Health policy, delivery, and organization";
              content = [
                "Health system structure (finance, manpower)",
                "Health policy-making process",
                "Health infrastructure and services"
              ];
            },
          ];
        },
      ];
    },
    {
      name = "AETCOM (Attitude, Ethics, and Communication)";
      subjects = [
        {
          id = 0;
          name = "Module 1.1: What does it mean to be a doctor?";
          mods = [
            {
              name = "Professional Expectations";
              description = "The role and responsibilities of doctors";
              content = [
                "Expectations from society, patients, and healthcare system"
              ];
            },
          ];
        },
        {
          id = 1;
          name = "Module 1.2: What does it mean to be a patient?";
          mods = [
            {
              name = "Understanding Illness";
              description = "Patient perspective of illness";
              content = [
                "Patient experiences and expectations during illness"
              ];
            },
          ];
        },
      ];
    },
  ];

  // turned entries into var to support explicit migration
  var timetableEntries : [TimetableEntry] = [];

  public query ({ caller }) func getCategoryByName(name : Text) : async ?SubjectCategory {
    categories.find(func(category) { category.name == name });
  };

  public query ({ caller }) func getAllCategories() : async [SubjectCategory] {
    categories;
  };

  public query ({ caller }) func getModsFromSubject(categoryName : Text, subjectId : Nat) : async ?[Mod] {
    switch (categories.find(func(category) { category.name == categoryName })) {
      case (null) { null };
      case (?category) {
        switch (category.subjects.find(func(subject) { subject.id == subjectId })) {
          case (null) { null };
          case (?subject) { ?subject.mods };
        };
      };
    };
  };

  public query ({ caller }) func getModFromSubjects(categoryName : Text, subjectId : Nat, modName : Text) : async ?Mod {
    switch (categories.find(func(category) { category.name == categoryName })) {
      case (null) { null };
      case (?category) {
        switch (category.subjects.find(func(subject) { subject.id == subjectId })) {
          case (null) { null };
          case (?subject) {
            subject.mods.find(func(mod) { mod.name == modName });
          };
        };
      };
    };
  };

  public query ({ caller }) func getSubjectsByCategoryIndex(index : Nat) : async ?[Subject] {
    if (index >= categories.size()) {
      return null;
    };
    ?categories[index].subjects;
  };

  public query ({ caller }) func getAllSubjects() : async [Subject] {
    var allSubjects = List.empty<Subject>();
    for (category in categories.values()) {
      allSubjects.addAll(category.subjects.values());
    };
    allSubjects.toArray();
  };

  public shared ({ caller }) func addTimetableEntry(
    subjectId : Nat,
    subjectName : Text,
    classType : Text,
    category : Text,
    dayOfWeek : Text,
    startTime : Nat,
    duration : Nat,
  ) : async () {
    let entry : TimetableEntry = {
      subjectId;
      subjectName;
      classType;
      category;
      dayOfWeek;
      startTime;
      duration;
    };

    timetableEntries := timetableEntries.concat([entry]);
  };

  public query ({ caller }) func getTimetable() : async [TimetableEntry] {
    timetableEntries;
  };

  public query ({ caller }) func getTimetableByDay(dayOfWeek : Text) : async [TimetableEntry] {
    timetableEntries.filter(func(t) { t.dayOfWeek == dayOfWeek });
  };

  public shared ({ caller }) func clearTimetable() : async () {
    timetableEntries := [];
  };

  public query ({ caller }) func getCategoryCount() : async Nat {
    categories.size();
  };

  public query ({ caller }) func getAllCategoryNames() : async [Text] {
    categories.map(func(category) { category.name });
  };
};

