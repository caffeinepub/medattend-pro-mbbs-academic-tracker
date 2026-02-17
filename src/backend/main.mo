import Array "mo:core/Array";

actor {
  type Mod = {
    name : Text;
    description : Text;
    content : [Text];
  };

  type FirstYearSubject = {
    id : Nat;
    name : Text;
    mods : [Mod];
  };

  let firstYearSubjects : [FirstYearSubject] = [
    {
      id = 0;
      name = "Procedural Programming";
      mods = [
        {
          name = "Intro to Programming";
          description = "Learn the basics of programming using Java";
          content = ["Variables and Data Types", "Control Structures", "Loops"];
        },
        {
          name = "Object-Oriented Programming";
          description = "Introduction to OOP concepts in Java";
          content = ["Classes and Objects", "Inheritance", "Polymorphism"];
        },
      ];
    },
    {
      id = 1;
      name = "Mathematics";
      mods = [
        {
          name = "Discrete Mathematics";
          description = "Mathematical reasoning and proofs";
          content = ["Logic", "Set Theory", "Combinatorics"];
        },
      ];
    },
  ];

  public query ({ caller }) func getAllFirstYearSubjects() : async [FirstYearSubject] {
    firstYearSubjects;
  };

  public query ({ caller }) func getFirstYearSubjectById(id : Nat) : async ?FirstYearSubject {
    firstYearSubjects.find(func(subject) { subject.id == id });
  };

  public query ({ caller }) func getModFromFirstYearSubject(subjectId : Nat, modName : Text) : async ?Mod {
    switch (firstYearSubjects.find(func(subject) { subject.id == subjectId })) {
      case (null) { null };
      case (?subject) {
        subject.mods.find(func(mod) { mod.name == modName });
      };
    };
  };
};
