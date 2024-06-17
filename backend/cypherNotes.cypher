
-- CYPHER
profile MATCH (s:Student {id: '5b73f3bc-0f01-4d24-b732-84c5ae123d29'})<-[:ASSIGNED_TO]-(ac)-[:OF_CONTEXT]->(c:Context) 
USING index c:Context(id)
USING index s:Student(id)
WHERE c.id in ["629181ec-f242-49d1-90d9-20eb04acd69b",
"d943ba18-869a-4d93-867f-d2a93fbc7d0e",
"f6ab9935-cf2a-4431-ac05-77df0edd469a",
"30998a36-aa79-44cc-8194-4adbb57673d4",
"ed9c493b-4799-4698-8d76-6eda864f699c",
"8f3803b0-3488-48a8-9eab-29a0da4a7cf8",
"9f17571f-a944-41e1-894e-38340580cbe4",
"84024ab5-5917-4c8b-bf90-5bb2d3908de5",
"7859fea9-2351-4dd4-84a6-96d02c6d4db2",
"6cc4204b-7655-40fd-a872-cfa6bbd6ae94",
"03bbf40c-4bdb-43f8-9390-26090449228a",
"f7ac5077-c665-4c01-81e4-1fc35cbeb0aa",
"2a26c582-d883-460a-b98a-3ca7b920cc41",
"a3db9e58-4866-45ec-bd8d-33d444924832",
"28aee33c-c73c-4738-b547-620bbaa59923"]
return count(*)


id	query
42	
		CREATE (sa:StudentAnswer{
		studentAnswerId: $studentAnswerId,
		questionAnswerId: $questionAnswerId,
		studentAnswer: $studentAnswer,
		questionAnswersOrder: $questionAnswersOrder,
		questionAnswersAssociation: $questionAnswersAssociation,
		timeSpent: $timeSpent,
		createdAt: datetime(),
		timestampDay: datetime().epochMillis / 1000 / 60 / 60 / 24})
		WITH sa
		MATCH (s:Student {id: $studentId}) 
		WITH sa, s
		MATCH (s)<-[:ASSIGNED_TO]-(ac:AssignedContext)-[:OF_CONTEXT]->(c:Context) 
		WHERE c.id in $contextId WITH sa, ac
		CREATE (ac)<-[:OF_ASSIGNED_CONTEXT]-(sa)
        
50	MATCH (q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
	MATCH (q)<-[:ANSWER_OF]-(:QuestionAnswer)
	WITH DISTINCT q
	OPTIONAL MATCH (:Student{id: $studentId})-[:ANSWERED]->(sa:StudentAnswer)-[:TO]->(q)
	WITH q.questionId as questionId, q.difficulty as difficulty, COUNT(sa) as attemptsPerQuestion
	ORDER BY questionId
	
	RETURN {questionId: questionId, difficulty: difficulty, attemptsPerQuestion: toFloat(attemptsPerQuestion)}
	ORDER BY attemptsPerQuestion
55	MATCH (this:Question)

WHERE (this.questionId = $param0 AND this.visible = $param1)
CALL {
    WITH this
    MATCH (this)<-[this0:ANSWER_OF]-(this1:QuestionAnswer)
    WITH this1 { .questionAnswerId, .text, .fraction } AS this1
    RETURN collect(this1) AS var2
}
RETURN this { .questionId, .questionCommand, .text, .visible, .type, answers: var2 } AS this

58	UNWIND $create_param0 AS create_var0
CALL {
    WITH create_var0
    CREATE (create_this1:Battle)
    SET
        create_this1.type = create_var0.type,
        create_this1.status = create_var0.status,
        create_this1.createdAt = datetime(),
        create_this1.updatedAt = datetime(),
        create_this1.id = randomUUID()
    
    RETURN create_this1
}
RETURN collect(create_this1 { .id }) AS data
59	UNWIND $create_param0 AS create_var0
CALL {
    WITH create_var0
    CREATE (create_this1:QuestionRound)
    SET
        create_this1.status = create_var0.status,
        create_this1.id = randomUUID()
    
    RETURN create_this1
}
RETURN collect(create_this1 { .id, .status }) AS data
60	MATCH (q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
					MATCH (q)<-[:ANSWER_OF]-(:QuestionAnswer)
					WITH DISTINCT q
					OPTIONAL MATCH (:Student{id: $studentId})-[:ANSWERED]->(sa:StudentAnswer)-[:TO]->(q)
					WITH q.questionId as questionId, q.difficulty as difficulty, COUNT(sa) as attemptsPerQuestion
					ORDER BY questionId
					
					RETURN {questionId: questionId, difficulty: difficulty, attemptsPerQuestion: toFloat(attemptsPerQuestion)}
					ORDER BY attemptsPerQuestion
61	MATCH (s:Student{id: $studentId})<-[rt:RECOMMENDED_TO]-(q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
					RETURN {questionId: q.questionId, questionDifficulty: q.difficulty, studentAbilityGlobal: rt.studentAbilityGlobal, studentAbilityInCourse: rt.studentAbilityInCourse, studentAbilityInTopic: rt.studentAbilityInTopic, abilityError: rt.abilityError, abilityErrorPercent: rt.abilityErrorPercent, studentSAEBAbilityInCourse: rt.studentSAEBAbilityInCourse, studentENEMAbilityInCourse: rt.studentENEMAbilityInCourse, hitProbability: rt.hitProbability, score: rt.score} as recommendedQuestion

					ORDER BY recommendedQuestion.score DESC

