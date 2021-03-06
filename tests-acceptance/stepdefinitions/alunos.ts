import { defineSupportCode } from 'cucumber';
import { browser, $, element, ElementArrayFinder, by } from 'protractor';
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;
import request = require("request-promise");

var base_url = "http://localhost:3000/";

let sameCPF = ((elem, cpf) => elem.element(by.name('cpflist')).getText().then(text => text === cpf));
let sameName = ((elem, name) => elem.element(by.name('nomelist')).getText().then(text => text === name));

let pAND = ((p,q) => p.then(a => q.then(b => a && b)))

async function criarAluno(name, cpf) {
    await $("input[name='namebox']").sendKeys(<string> name);
    await $("input[name='cpfbox']").sendKeys(<string> cpf);
    await element(by.buttonText('Adicionar')).click();
}

async function cadastrarNota(cpf, notanumber, nota)  {
    await element(by.id(`${cpf} ${notanumber}`)).sendKeys(<number> nota);
}       

async function removerNota(cpf, notanumber){
   await element(by.id(`${cpf} ${notanumber} buttonremover`)).click();
}

async function assertGradeNull(cpf, notanumber) {
    const currentGrade = await element(by.id(`${cpf} ${notanumber}`)).getAttribute('value')
    expect(currentGrade).to.equal('')
}

async function assertGrade(cpf, notanumber, nota) {
    const currentGrade = await element(by.id(`${cpf} ${notanumber}`)).getAttribute('value')
    expect(currentGrade).to.equal(nota)
}

async function assertTamanhoEqual(set,n) {
    await set.then(elems => expect(Promise.resolve(elems.length)).to.eventually.equal(n));
}

async function assertElementsWithSameCPFAndName(n,cpf,name) { 
    var allalunos : ElementArrayFinder = element.all(by.name('alunolist'));
    var samecpfsandname = allalunos.filter(elem => pAND(sameCPF(elem,cpf),sameName(elem,name)));
    await assertTamanhoEqual(samecpfsandname,n);
}

async function assertElementsWithSameCPF(n,cpf) {
    var allalunos : ElementArrayFinder = element.all(by.name('alunolist'));
    var samecpfs = allalunos.filter(elem => sameCPF(elem,cpf));
    await assertTamanhoEqual(samecpfs,n); 
}

defineSupportCode(function ({ Given, When, Then }) {
    Given(/^I am at the students page$/, async () => {
        await browser.get("http://localhost:4200/");
        await expect(browser.getTitle()).to.eventually.equal('TaGui');
        await $("a[name='alunos']").click();
    })
    
    Given(/^I am at the grades page$/, async () => {
        await browser.get("http://localhost:4200/");
        await expect(browser.getTitle()).to.eventually.equal('TaGui');
        await $("a[name='notas']").click();
    })

    Given(/^I cannot see a student with CPF "(\d*)" in the students list$/, async (cpf) => {
        await assertElementsWithSameCPF(0,cpf);
    });

    When(/^I try to register the student "([^\"]*)" with CPF "(\d*)"$/, async (name, cpf) => {
        await criarAluno(name,cpf);
    });

    Then(/^I can see "([^\"]*)" with CPF "(\d*)" in the students list$/, async (name, cpf) => {
        await assertElementsWithSameCPFAndName(1,cpf,name);
    });

    Given(/^I can see a student with CPF "(\d*)" in the grades list$/, async (cpf) => {
        await $("a[name='alunos']").click();
        await criarAluno("Mari",cpf);
        //await assertElementsWithSameCPF(1,cpf);
        await $("a[name='notas']").click(); 
    });
    
    Given(/^I cannot see any grade in the "([^\"]*)" space for the student with CPF "(\d*)"$/, async (notanumber, cpf) => {
        await assertGradeNull(cpf, notanumber);
    });

    When(/^I try to register "(\d*)" in "([^\"]*)" as a grade for "([^\"]*)" with CPF "(\d*)"$/, async (nota, notanumber, name, cpf) => {
        await cadastrarNota(cpf, notanumber, nota);
    });
    
    Then(/^I can see "([^\"]*)" with CPF "(\d*)" and "(\d*)" in "([^\"]*)" in the grades list$/, async (name, cpf, nota, notanumber) => {
        await assertGrade(cpf, notanumber, nota);
    });

    Then(/^I cannot see "([^\"]*)" with CPF "(\d*)" in the students list$/, async (name, cpf) => {
        await assertElementsWithSameCPFAndName(0,cpf,name);
    });

    Then(/^I can see an error message$/, async () => {
        var allmsgs : ElementArrayFinder = element.all(by.name('msgcpfexistente'));
        await assertTamanhoEqual(allmsgs,1);
    });

    Given(/^the system has no student with CPF "(\d*)"$/, async (cpf) => {
       await request.get(base_url + "alunos")
                .then(body => 
                    expect(body.includes('"cpf":"685"')).to.equal(false));
    });

    When(/^I register the student "([^\"]*)" with CPF "(\d*)"$/, async (name, cpf) => {
        let aluno = {"nome": name, "cpf" : cpf, "email":""};
        var options:any = {method: 'POST', uri: (base_url + "aluno"), body:aluno, json: true};
        await request(options)
              .then(body => 
                   expect(JSON.stringify(body)).to.equal(
                       '{"success":"O aluno foi cadastrado com sucesso"}'));
    });

    Then(/^the system now stores "([^\"]*)" with CPF "(\d*)"$/, async (name, cpf) => {
        let resposta = `{"nome":"${name}","cpf":"${cpf}","email":"","metas":{}`;
        await request.get(base_url + "alunos")
                     .then(body => expect(body.includes(resposta)).to.equal(true));
    });
    
    Given(/^I am in grades page$/, async () => {
        await browser.get("http://localhost:4200/");
        await expect(browser.getTitle()).to.eventually.equal('TaGui');
        await $("a[name='notas']").click();
    });

    Given(/^I see a student with CPF "(\d*)" in the grades list$/, async (cpf) => {
        await $("a[name='alunos']").click();
        await criarAluno("Priscilla",cpf);
        await $("a[name='notas']").click(); 
    });

    Given(/^I see the value "(\d*)" in "([^\"]*)" space for the student with CPF "(\d*)"$/, async (nota, notanumber,cpf) => {
        await cadastrarNota(cpf, notanumber, nota);
    });

    When(/^I try to remove the grade in the "([^\"]*)" space for the student with CPF "(\d*)"$/, async (notanumber,cpf) => {
        await removerNota(cpf, notanumber);
    });

    Then(/^I cannot see any grade in the "([^\"]*)" for the student with CPF "(\d*)"$/, async (notanumber, cpf) => {
        await assertGradeNull(cpf, notanumber);
    });

})
