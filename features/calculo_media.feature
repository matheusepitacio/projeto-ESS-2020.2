Scenario: Nota máxima
Given eu tenho o aluno "Pedro" com o cpf "123"
And ele tem os conceitos "MA", "MA" e "-"
When eu informo "MA" para o conceito faltante
Then é registrado no sistema os conceitos "MA", "MA" e "MA" para o aluno "Pedro"
And a média dele aparece como "10"
And o status dele aparece como "aprovado"