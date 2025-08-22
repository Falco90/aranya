# 🌳 Aranya

Aranya is a course platform that provides on-chain credentials for learners and teachers in the form of Tree NFTs that grow as course milestones are reached. Aranya leverages the Flare Data Connector to ensure data integrity of teachers and learners. Aranya smart contracts are currently only deployed on Flare Coston2 testnet.

Warning: this project is in a very early stage and has not been tested thoroughly.

## How it works
### Creating a course
1. When the teacher creates a course on the frontend, the course is first saved to the database.
2. An attestation is submitted and a proof is retrieved with the courseId and teacherId (connected wallet address).
3. The proof is sent as argument to the createCourse function call on the [CourseManager](https://coston2-explorer.flare.network/address/0x0e2BD92A03Ce316f0077F635E29C30C93c8Ed341?tab=index) contract, ensuring integrity of teacherId and courseId.
4. Clones of [CreatorNFT](https://coston2-explorer.flare.network/address/0x3d02a89b826C6Fed39208AF551CD09B840640459) and [LearnerNFT](https://coston2-explorer.flare.network/address/0x2598224eF35566bB39C4D99e5E6B14A5D677d069) are deployed.
5. A token of CreatorNFT is minted to the teacher address.

### Enrolling in a course
1. When a learner enrolls in a course on the frontend, the enrollment is first saved to the database.
2. An attestation is submitted and a proof is retrieved with the courseId and learnerId (connected wallet address).
3. The proof is sent as argument to the enroll function call on the CourseManager contract, ensuring integrity of learnerId and courseId.
4. A token on the LearnerNFT contract tied to the course is minted to the learner.

### Upgrading CreatorNFT or LearnerNFT
1. When a teacher or learner reaches certain milestones in their course (X% of modules completed for learner, or X number of learners that completed course for teacher), upgrade NFT can be called from the frontend.
2. An attestation is submitted and a proof is retrieved with the courseId and either the number of completions (teacher) or progress percentage (learner).
3. The updateMilestone function is called on the LearnerNFT or CreatorNFT contract with the proof as argument, ensuring integrity of learner or teacher data.

## Installation
Aranya has a Rust backend and a NextJS frontend. To run the repository locally you need to have Rust installed as well as TypeScript and Node. You will also need [ngrok](https://ngrok.com/) because the backend endpoints on localhost need to be accesible for Flare the Flare Data Connector to interact with.

### Setting up the backend
```
cd backend
cp .env.example .env
cargo install
cargo run
```
In another tab:
```
ngrok http 4000
```

### Setting up the webapp
```
cd webapp
cp .env.example .env
npm install
npm run dev
```